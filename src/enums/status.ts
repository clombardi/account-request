export enum Status {
    PENDING = 'Pending',
    ANALYSING = 'Analysing',
    ACCEPTED = 'Accepted',
    REJECTED = 'Rejected'
}

/* the cast is needed if either of TS compiler options "strict" or "noImplicitAny" are enabled,
   since non-literal subscripts to search into an enum 
   (or more generally, inta the set of keys of an object type)
   are not accepted.
   The cast force the string to be treated as a legal enum type key.

   Even when the reverse mapping can be achieved much more simply by just casting the String,
   I still keep this function mostly for the comments.
 */
export function statusReverseMapping(str: string): Status {
    const key: keyof typeof Status = (str.toUpperCase()) as keyof typeof Status
    return Status[key]
}



