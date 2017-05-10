/**
 * Abstract UUID generation away, so we can replace it easily later if
 * we find we can't generate random enough UUIDs on some clients.
 * 
 * Returning UUID as a promise, so we can generate UUIDs in an asynchronous
 * way in the future, if we want to.
 */

import { v4 as uuidv4 } from 'uuid';

export function generateUUID() {
    return Promise.resolve(uuidv4());
}