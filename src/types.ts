import { Client } from '@opensearch-project/opensearch';

export interface Logger {
    debug: (message: string, context?: { error?: any; data?: any }) => void;
    [key: string]: any;
}

export interface OpenSearchContext {
    client: Client;
    logger?: Logger;
}
