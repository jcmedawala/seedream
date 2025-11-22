import styles from './ResultViewer.module.css';

interface ResultViewerProps {
    resultUrl: string | null;
    originalUrl: string;
}

export default function ResultViewer({ resultUrl, originalUrl }: ResultViewerProps) {
    if (!resultUrl) return null;

    return (
        <div className={styles.container}>
            <div className={styles.imageWrapper}>
                <h3>Original</h3>
                <img src={originalUrl} alt="Original" className={styles.image} />
            </div>
            <div className={styles.imageWrapper}>
                <h3>Generated Result</h3>
                <img src={resultUrl} alt="Generated" className={styles.image} />
                <a href={resultUrl} target="_blank" rel="noopener noreferrer" className={styles.download}>
                    Download High Res
                </a>
            </div>
        </div>
    );
}
