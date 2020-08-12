export const findByCustomerFor = <T extends { customer: string }>(requests: T[]) =>
    (name: string) => requests.find(req => req.customer === name);

export const findSureByCustomerFor = <T extends { customer: string }>(requests: T[]) =>
    (name: string) => requests.find(req => req.customer === name) as T;

