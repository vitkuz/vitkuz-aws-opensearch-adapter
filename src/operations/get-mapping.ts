import { ApiResponse } from '@opensearch-project/opensearch';
import { OpenSearchContext } from '../types';

export interface GetMappingInput {
    index: string;
}

export const getMapping =
    (context: OpenSearchContext) =>
    async (input: GetMappingInput): Promise<ApiResponse> => {
        const { client, logger } = context;
        const { index } = input;

        logger?.debug('getMapping:start', { data: { index } });

        try {
            const response = await client.indices.getMapping({
                index,
            });
            logger?.debug('getMapping:success', { data: { index } });
            return response;
        } catch (error) {
            logger?.debug('getMapping:error', { error });
            throw error;
        }
    };
