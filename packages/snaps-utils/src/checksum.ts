import { assert, concatBytes, stringToBytes } from '@metamask/utils';
import { sha256 } from '@noble/hashes/sha256';

import { VirtualFile } from './virtual-file/VirtualFile';

/**
 * Convert an input value to a Uint8Array for use in a checksum.
 *
 * @param bytes - A value to use for a checksum calculation.
 * @returns The input value converted to a Uint8Array if necessary.
 */
export function getChecksumBytes(
  bytes: VirtualFile | Uint8Array | string,
): Uint8Array {
  // Unwrap VirtualFiles to extract the content
  // The content is then either a string or Uint8Array
  const unwrapped = bytes instanceof VirtualFile ? bytes.value : bytes;

  if (typeof unwrapped === 'string') {
    return stringToBytes(unwrapped);
  }

  return unwrapped;
}

/**
 * Calculates checksum for a single byte array.
 *
 * @param bytes - The byte array to calculate the checksum for.
 * @returns A single sha-256 checksum.
 */
export async function checksum(
  bytes: VirtualFile | Uint8Array | string,
): Promise<Uint8Array> {
  const value = getChecksumBytes(bytes);
  // Use crypto.subtle.digest whenever possible as it is faster.
  if (
    'crypto' in globalThis &&
    typeof globalThis.crypto === 'object' &&
    crypto.subtle?.digest
  ) {
    return new Uint8Array(await crypto.subtle.digest('SHA-256', value));
  }
  return sha256(value);
}

/**
 * Calculates checksum over multiple files in a reproducible way.
 *
 * 1. Sort all the files by their paths.
 * 2. Calculate sha-256 checksum of each file separately.
 * 3. Concatenate all the checksums into one buffer and sha-256 that buffer.
 *
 * The sorting of paths is done using {@link https://tc39.es/ecma262/#sec-islessthan UTF-16 Code Units}.
 *
 * @param files - The files over which to calculate the checksum.
 * @returns A single sha-256 checksum.
 */
export async function checksumFiles(files: VirtualFile[]) {
  const checksums = await Promise.all(
    [...files]
      .sort((a, b) => {
        assert(a.path !== b.path, 'Tried to sort files with non-unique paths.');
        if (a.path < b.path) {
          return -1;
        }
        return 1;
      })
      .map(async (file) => checksum(file)),
  );

  return checksum(concatBytes(checksums));
}
