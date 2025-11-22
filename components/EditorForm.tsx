
import { useState } from 'react';
import styles from './EditorForm.module.css';


interface EditorFormProps {
    onSubmit: (data: any) => void;
    isLoading: boolean;
}

export default function EditorForm({ onSubmit, isLoading }: EditorFormProps) {
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [currentInputUrl, setCurrentInputUrl] = useState('');
    const [prompt, setPrompt] = useState('');
    const [imageSize, setImageSize] = useState<string>('square_hd');

    const [isUploading, setIsUploading] = useState(false);

    const addImageUrl = (url: string) => {
        if (url && !imageUrls.includes(url)) {
            setImageUrls([...imageUrls, url]);
            setCurrentInputUrl('');
        }
    };

    const removeImage = (index: number) => {
        setImageUrls(imageUrls.filter((_, i) => i !== index));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                const data = await res.json();
                if (data.error) throw new Error(data.error);
                return data.url;
            });

            const uploadedUrls = await Promise.all(uploadPromises);

            // Add all new URLs to the state
            const newUrls = uploadedUrls.filter(url => !imageUrls.includes(url));
            if (newUrls.length > 0) {
                setImageUrls(prev => [...prev, ...newUrls]);
            }

        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload one or more images');
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (imageUrls.length === 0) {
            alert('Please add at least one image.');
            return;
        }
        onSubmit({
            prompt,
            image_urls: imageUrls,
            image_size: imageSize,
        });
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.group}>
                <label htmlFor="imageSize">Image Size</label>
                <select
                    id="imageSize"
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value)}
                    className={styles.select}
                >
                    <option value="square">Square (1024x1024)</option>
                    <option value="square_hd">Square HD (2048x2048)</option>
                    <option value="portrait_4_3">Portrait 3:4</option>
                    <option value="portrait_3_2">Portrait 2:3</option>
                    <option value="portrait_16_9">Portrait 9:16</option>
                    <option value="landscape_4_3">Landscape 4:3</option>
                    <option value="landscape_3_2">Landscape 3:2</option>
                    <option value="landscape_16_9">Landscape 16:9</option>
                    <option value="landscape_21_9">Landscape 21:9</option>
                </select>
            </div>

            <div className={styles.group}>
                <label>Reference Images ({imageUrls.length})</label>

                <div className={styles.imageList}>
                    {imageUrls.map((url, index) => (
                        <div key={index} className={styles.imageItem}>
                            <img src={url} alt={`Reference ${index + 1}`} />
                            <button type="button" onClick={() => removeImage(index)} className={styles.removeButton}>×</button>
                        </div>
                    ))}
                </div>

                <div className={styles.inputWrapper}>
                    <input
                        type="url"
                        value={currentInputUrl}
                        onChange={(e) => setCurrentInputUrl(e.target.value)}
                        placeholder="Add image URL..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addImageUrl(currentInputUrl);
                            }
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => addImageUrl(currentInputUrl)}
                        className={styles.addButton}
                        disabled={!currentInputUrl}
                    >
                        Add
                    </button>
                </div>

                <div className={styles.fileUpload}>
                    <span className={styles.orText}>OR Upload File:</span>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                    {isUploading && <span className={styles.uploadingText}>Uploading...</span>}
                </div>
                <small className={styles.hint}>
                    <button
                        type="button"
                        className={styles.linkButton}
                        onClick={() => addImageUrl('https://file.aiquickdraw.com/custom-page/akr/section-images/1757930552966e7f2on7s.png')}
                    >
                        Add Example Image
                    </button>
                </small>
            </div>

            <div className={styles.group}>
                <label htmlFor="prompt">Prompt</label>
                <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe how to edit the image..."
                    rows={4}
                    required
                />
            </div>

            <button type="submit" className={styles.button} disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate Image'}
            </button>
        </form>
    );
}
