import { ApiResponse } from '@opensearch-project/opensearch';
import { v4 as uuidv4 } from 'uuid';
import { OpenSearchContext } from '../types';

export type BatchActionType = 'index' | 'create' | 'delete' | 'update';

export interface BatchOperationItem {
    type: BatchActionType;
    index: string;
    id?: string;
    body?: Record<string, any>; // For index, create, update
    doc?: Record<string, any>; // For helper usage if mapped from elsewhere, but usually body covers it
}

export interface BatchWriteInput {
    operations: BatchOperationItem[];
    refresh?: boolean | 'wait_for';
}

export const batchWrite =
    (context: OpenSearchContext) =>
    async (input: BatchWriteInput): Promise<ApiResponse> => {
        const { client, logger } = context;
        const { operations, refresh } = input;

        logger?.debug('batchWrite:start', { data: { count: operations.length } });

        if (operations.length === 0) {
            return {
                body: { errors: false, items: [], took: 0 },
                statusCode: 200,
                headers: {},
                meta: {} as any,
                warnings: [],
            };
        }

        const bulkBody: any[] = [];

        for (const op of operations) {
            const action: any = {};
            const meta: any = { _index: op.index };

            // Generate ID for index/create if missing
            if (op.id) {
                meta._id = op.id;
            } else if (op.type === 'index' || op.type === 'create') {
                meta._id = uuidv4();
            }

            action[op.type] = meta;
            bulkBody.push(action);

            if (op.type !== 'delete') {
                bulkBody.push(op.body || {});
            }
        }

        try {
            const response = await client.bulk({
                body: bulkBody,
                refresh: refresh as any,
            });

            logger?.debug('batchWrite:success', {
                data: { took: response.body.took, errors: response.body.errors },
            });
            return response;
        } catch (error) {
            logger?.debug('batchWrite:error', { error });
            throw error;
        }
    };
