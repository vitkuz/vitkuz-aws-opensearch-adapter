import { ApiResponse } from '@opensearch-project/opensearch';
import { OpenSearchContext } from '../types';

export interface CreateIndexInput {
    index: string;
    body?: Record<string, any>; // Settings, mappings, etc.
}

export const createIndex =
    (context: OpenSearchContext) =>
    async (input: CreateIndexInput): Promise<ApiResponse> => {
        const { client, logger } = context;
        const { index, body } = input;

        logger?.debug('createIndex:start', { data: { index } });

        try {
            const response = await client.indices.create({
                index,
                body,
            });
            logger?.debug('createIndex:success', { data: { index } });
            return response;
        } catch (error) {
            logger?.debug('createIndex:error', { error });
            throw error;
        }
    };
