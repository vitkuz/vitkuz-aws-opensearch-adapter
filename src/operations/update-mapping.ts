import { ApiResponse } from '@opensearch-project/opensearch';
import { OpenSearchContext } from '../types';

export interface UpdateMappingInput {
    index: string;
    body: Record<string, any>;
}

export const updateMapping =
    (context: OpenSearchContext) =>
    async (input: UpdateMappingInput): Promise<ApiResponse> => {
        const { client, logger } = context;
        const { index, body } = input;

        logger?.debug('updateMapping:start', { data: { index } });

        try {
            const response = await client.indices.putMapping({
                index,
                body,
            });
            logger?.debug('updateMapping:success', { data: { index } });
            return response;
        } catch (error) {
            logger?.debug('updateMapping:error', { error });
            throw error;
        }
    };
