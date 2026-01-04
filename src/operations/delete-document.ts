import { ApiResponse } from '@opensearch-project/opensearch';
import { OpenSearchContext } from '../types';

export interface DeleteDocumentInput {
    index: string;
    id: string;
    refresh?: boolean | 'wait_for';
}

export const deleteDocument =
    (context: OpenSearchContext) =>
    async (input: DeleteDocumentInput): Promise<ApiResponse> => {
        const { client, logger } = context;
        const { index, id, refresh } = input;

        logger?.debug('deleteDocument:start', { data: { index, id } });

        try {
            const response = await client.delete({
                index,
                id,
                refresh: refresh as any,
            });
            logger?.debug('deleteDocument:success', { data: { index, id } });
            return response;
        } catch (error) {
            logger?.debug('deleteDocument:error', { error });
            throw error;
        }
    };
