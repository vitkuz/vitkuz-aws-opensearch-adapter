import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { createAdapter } from '../src/adapter';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from root .env if present, or rely on process env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const OPENSEARCH_ENDPOINT = process.env.OPENSEARCH_ENDPOINT;
const REGION = process.env.AWS_REGION || 'us-east-1';

if (!OPENSEARCH_ENDPOINT) {
    throw new Error('Missing OPENSEARCH_ENDPOINT environment variable');
}

export const getClient = () => {
    return new Client({
        ...AwsSigv4Signer({
            region: REGION,
            service: 'es',
            getCredentials: () => defaultProvider()(),
        }),
        node: `https://${OPENSEARCH_ENDPOINT}`,
    });
};

export const getAdapter = () => {
    const client = getClient();
    // Minimal mock logger for tests
    const logger: any = {
        debug: (msg: string, ...args: any[]) => console.log(`[DEBUG] ${msg}`, ...args),
        info: (msg: string, ...args: any[]) => console.log(`[INFO] ${msg}`, ...args),
        error: (msg: string, ...args: any[]) => console.error(`[ERROR] ${msg}`, ...args),
    };
    return createAdapter({ client, logger });
};

export const generateIndexName = () =>
    `test-index-${Date.now()}-${Math.random().toString(36).substring(7)}`;
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

import fs from 'fs';
export const saveResponse = (folderName: string, fileName: string, data: any) => {
    const dirPath = path.join(__dirname, 'responses', folderName);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    const filePath = path.join(dirPath, `${fileName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Saved response to ${filePath}`);
};

export const generateUsers = (indexName: string, count: number = 10) => {
    const departments = ['Engineering', 'Sales', 'HR', 'Marketing'];
    const users = [];

    for (let i = 0; i < count; i++) {
        const dept = departments[i % departments.length];
        const salary = 50000 + i * 5000; // 50000, 55000, 60000...
        users.push({
            type: 'index' as const,
            index: indexName,
            id: `user-${i}`,
            body: {
                id: `user-${i}`,
                name: `User ${i}`,
                department: dept,
                salary: salary,
                joined_date: new Date().toISOString(),
            },
        });
    }
    return users;
};
