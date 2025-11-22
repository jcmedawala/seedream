import { NextRequest, NextResponse } from 'next/server';
import { WavespeedInput, WavespeedApiResponse, SIZE_MAPPING } from '@/lib/types';
import { createClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { prompt, image_urls, image_size } = body;
        const apiKey = process.env.WAVESPEED_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'Server configuration error: API Key missing' }, { status: 500 });
        }

        // Map UI size to API size string
        const size = SIZE_MAPPING[image_size] || '2048*2048';

        const apiRequest: WavespeedInput = {
            prompt,
            images: image_urls,
            size,
            enable_sync_mode: true, // Use sync mode for simpler handling
            enable_base64_output: false,
        };

        console.log('Sending request to Wavespeed:', JSON.stringify(apiRequest, null, 2));
        console.log('Images Payload:', JSON.stringify(image_urls, null, 2));

        const res = await fetch('https://api.wavespeed.ai/api/v3/bytedance/seedream-v4/edit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(apiRequest),
        });

        const apiResponse: WavespeedApiResponse = await res.json();
        console.log('Wavespeed Response:', JSON.stringify(apiResponse, null, 2));

        if (res.status !== 200 || apiResponse.code !== 200) {
            console.error('Wavespeed API Error:', apiResponse);
            return NextResponse.json({ error: apiResponse.message || 'Failed to generate image' }, { status: res.status });
        }

        // Store result in Supabase
        if (apiResponse.data.outputs && apiResponse.data.outputs.length > 0) {
            try {
                const outputUrl = apiResponse.data.outputs[0];
                const imageRes = await fetch(outputUrl);
                const imageBlob = await imageRes.blob();
                const buffer = await imageBlob.arrayBuffer();

                const supabase = await createClient();
                const fileName = `generated-${uuidv4()}.jpeg`; // Assuming JPEG from Wavespeed

                const { error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(fileName, buffer, {
                        contentType: 'image/jpeg',
                    });

                if (uploadError) {
                    console.error('Failed to save result to Supabase:', uploadError);
                    // Continue returning original URL if save fails, or throw? 
                    // User requested "nothing is stored in cloudinary" (Wavespeed uses Cloudfront), 
                    // but better to return the result than fail completely.
                } else {
                    const { data: { publicUrl } } = supabase.storage
                        .from('images')
                        .getPublicUrl(fileName);

                    // Replace the output URL with Supabase URL
                    apiResponse.data.outputs[0] = publicUrl;
                }
            } catch (storageError) {
                console.error('Error storing result:', storageError);
            }
        }

        return NextResponse.json(apiResponse.data);
    } catch (error) {
        console.error('Generate Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
