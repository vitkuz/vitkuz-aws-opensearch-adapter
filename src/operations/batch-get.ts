import { ApiResponse } from '@opensearch-project/opensearch';
import { OpenSearchContext } from '../types';

export interface BatchGetInput {
    index: string;
    ids: string[];
}

export const batchGet =
    (context: OpenSearchContext) =>
    async (input: BatchGetInput): Promise<ApiResponse> => {
        const { client, logger } = context;
        const { index, ids } = input;

        logger?.debug('batchGet:start', { data: { index, count: ids.length } });

        try {
            const response = await client.mget({
                index,
                body: {
                    ids,
                },
            });
            logger?.debug('batchGet:success', { data: { found: response.body.docs?.length } });
            return response;
        } catch (error) {
            logger?.debug('batchGet:error', { error });
            throw error;
        }
    };
