import { ApiResponse } from '@opensearch-project/opensearch';
import { OpenSearchContext } from '../types';

export interface DeleteIndexInput {
    index: string;
}

export const deleteIndex =
    (context: OpenSearchContext) =>
    async (input: DeleteIndexInput): Promise<ApiResponse> => {
        const { client, logger } = context;
        const { index } = input;

        logger?.debug('deleteIndex:start', { data: { index } });

        try {
            const response = await client.indices.delete({
                index,
            });
            logger?.debug('deleteIndex:success', { data: { index } });
            return response;
        } catch (error) {
            logger?.debug('deleteIndex:error', { error });
            throw error;
        }
    };
