import { ApiResponse } from '@opensearch-project/opensearch';
import { OpenSearchContext } from '../types';

export interface GetDocumentInput {
    index: string;
    id: string;
}

export const getDocument =
    (context: OpenSearchContext) =>
    async (input: GetDocumentInput): Promise<ApiResponse> => {
        const { client, logger } = context;
        const { index, id } = input;

        logger?.debug('getDocument:start', { data: { index, id } });

        try {
            const response = await client.get({
                index,
                id,
            });
            logger?.debug('getDocument:success', { data: { index, id } });
            return response;
        } catch (error) {
            logger?.debug('getDocument:error', { error });
            throw error;
        }
    };
