import { Client, ClientOptions } from '@opensearch-project/opensearch';

export const createClient = (options: ClientOptions): Client => {
    return new Client(options);
};
