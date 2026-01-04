import { ApiResponse } from '@opensearch-project/opensearch';
import { OpenSearchContext } from '../types';

export interface GetIndexInput {
    index: string;
}

export const getIndex =
    (context: OpenSearchContext) =>
    async (input: GetIndexInput): Promise<ApiResponse> => {
        const { client, logger } = context;
        const { index } = input;

        logger?.debug('getIndex:start', { data: { index } });

        try {
            const response = await client.indices.get({
                index,
            });
            logger?.debug('getIndex:success', { data: { index } });
            return response;
        } catch (error) {
            logger?.debug('getIndex:error', { error });
            throw error;
        }
    };
