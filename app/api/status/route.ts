import { NextRequest, NextResponse } from 'next/server';
import { TaskStatusResponse } from '@/lib/types';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');
    const apiKey = process.env.SEEDREAM_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: 'Server configuration error: API Key missing' }, { status: 500 });
    }

    if (!taskId) {
        return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    try {
        const res = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
        });

        const data: TaskStatusResponse = await res.json();

        if (data.code !== 200) {
            return NextResponse.json({ error: data.msg || 'Failed to get task status' }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Get Status Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
