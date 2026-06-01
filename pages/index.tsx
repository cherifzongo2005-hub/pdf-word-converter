import Head from 'next/head';
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from './index.module.css';
import { docxToHtml, htmlToPdfBlob, pdfToText, textToDocxBlob, downloadBlob, getOutputFilename } from '../utils/converter';

type Mode = 'word-to-pdf' | 'pdf-to-word';
type Status = 'idle' | 'loading' | 'success' | 'error';

export default function Home() {
  const [mode, setMode] = useState<Mode>('pdf-to-word');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [progress, setProgress] = useState(0);

  const accept = mode === 'pdf-to-word'
    ? { 'application/pdf': ['.pdf'] }
    : { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] };

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) { setFile(accepted[0]); setStatus('idle'); setErrorMsg(''); setProgress(0); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept, maxFiles: 1, maxSize: 20 * 1024 * 1024 });

  const handleConvert = async () => {
    if (!file) return;
    setStatus('loading'); setProgress(10); setErrorMsg('');
    try {
      if (mode === 'pdf-to-word') {
        setProgress(30);
        const text = await pdfToText(file);
        setProgress(70);
        const blob = await textToDocxBlob(text, file.name);
        setProgress(95);
        downloadBlob(blob, getOutputFilename(file.name, 'docx'));
      } else {
        setProgress(30);
        const html = await docxToHtml(file);
        setProgress(60);
        const blob = await htmlToPdfBlob(html, file.name);
        setProgress(95);
        downloadBlob(blob, getOutputFilename(file.name, 'pdf'));
      }
      setProgress(100); setStatus('success');
    } catch (e: any) {
      setErrorMsg(e.message || 'Erreur lors de la conversion');
      setStatus('error');
    }
  };

  const reset = () => { setFile(null); setStatus('idle'); setErrorMsg(''); setProgress(0); };
  const switchMode = (m: Mode) => { setMode(m); reset(); };

  return (
    <>
      <Head><title>DocShift — Convertisseur PDF ↔ Word</title></Head>
      <div className={styles.page}>
        <div className={styles.noise} />
        <div className={styles.grid} />
        <header className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⬡</span>
            <span className={styles.logoText}>DOC<em>SHIFT</em></span>
          </div>
          <nav className={styles.nav}>
            <span className={styles.navTag}>v1.0</span>
            <span className={styles.navTag}>Gratuit</span>
            <span className={styles.navTag}>100% Local</span>
          </nav>
        </header>
        <section className={styles.hero}>
          <p className={styles.heroSub}>CONVERSION DE DOCUMENTS</p>
          <h1 className={styles.heroTitle}>PDF <span className={styles.arrow}>⇄</span> Word</h1>
          <p className={styles.heroDesc}>Convertissez instantanément — tout traitement s'effectue dans votre navigateur, aucun fichier n'est envoyé sur un serveur.</p>
        </section>
        <div className={styles.modeSwitcher}>
          <button className={`${styles.modeBtn} ${mode === 'pdf-to-word' ? styles.modeBtnActive : ''}`} onClick={() => switchMode('pdf-to-word')}>
            <span className={styles.modeBtnIcon}>📄</span>PDF → Word
          </button>
          <div className={styles.modeDivider} />
          <button className={`${styles.modeBtn} ${mode === 'word-to-pdf' ? styles.modeBtnActive : ''}`} onClick={() => switchMode('word-to-pdf')}>
            <span className={styles.modeBtnIcon}>📝</span>Word → PDF
          </button>
        </div>
        <main className={styles.card}>
          <div className={styles.steps}>
            <div className={`${styles.step} ${file ? styles.stepDone : styles.stepActive}`}>
              <span className={styles.stepNum}>01</span><span>Sélectionner</span>
            </div>
            <div className={styles.stepLine} />
            <div className={`${styles.step} ${status === 'loading' ? styles.stepActive : ''} ${status === 'success' ? styles.stepDone : ''}`}>
              <span className={styles.stepNum}>02</span><span>Convertir</span>
            </div>
            <div className={styles.stepLine} />
            <div className={`${styles.step} ${status === 'success' ? styles.stepDone : ''}`}>
              <span className={styles.stepNum}>03</span><span>Télécharger</span>
            </div>
          </div>
          {status !== 'success' && (
            <div {...getRootProps()} className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''} ${file ? styles.dropzoneHasFile : ''}`}>
              <input {...getInputProps()} />
              {file ? (
                <div className={styles.fileInfo}>
                  <div className={styles.fileIcon}>{mode === 'pdf-to-word' ? '📕' : '📘'}</div>
                  <div className={styles.fileMeta}>
                    <span className={styles.fileName}>{file.name}</span>
                    <span className={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <button className={styles.fileRemove} onClick={(e) => { e.stopPropagation(); reset(); }}>✕</button>
                </div>
              ) : (
                <div className={styles.dropContent}>
                  <div className={styles.dropIconWrap}>
                    <span className={styles.dropIconMain}>{isDragActive ? '↓' : '+'}</span>
                  </div>
                  <p className={styles.dropTitle}>{isDragActive ? 'Déposez le fichier ici' : `Déposez votre fichier ${mode === 'pdf-to-word' ? '.PDF' : '.DOCX'}`}</p>
                  <p className={styles.dropSub}>ou cliquez pour parcourir — max 20 MB</p>
                </div>
              )}
            </div>
          )}
          {status === 'loading' && (
            <div className={styles.progressWrap}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
              <span className={styles.progressLabel}>Conversion en cours... {progress}%</span>
            </div>
          )}
          {status === 'error' && (
            <div className={styles.errorBox}>
              <span className={styles.errorIcon}>⚠</span>
              <div>
                <p className={styles.errorTitle}>Erreur de conversion</p>
                <p className={styles.errorMsg}>{errorMsg}</p>
              </div>
            </div>
          )}
          {status === 'success' && (
            <div className={styles.successBox}>
              <div className={styles.successIcon}>✓</div>
              <p className={styles.successTitle}>Fichier converti !</p>
              <p className={styles.successSub}>Le téléchargement a démarré automatiquement.</p>
              <button className={styles.btnSecondary} onClick={reset}>Convertir un autre fichier</button>
            </div>
          )}
          {status !== 'success' && (
            <button className={styles.btnPrimary} onClick={handleConvert} disabled={!file || status === 'loading'}>
              {status === 'loading' ? <span className={styles.btnSpinner} /> : <><span>Convertir</span><span className={styles.btnArrow}>→</span></>}
            </button>
          )}
        </main>
        <section className={styles.features}>
          {[
            { icon: '🔒', title: 'Privé', desc: 'Vos fichiers ne quittent jamais votre appareil' },
            { icon: '⚡', title: 'Instantané', desc: 'Conversion côté client, sans délai serveur' },
            { icon: '♾️', title: 'Illimité', desc: 'Aucune limite de taille ou de nombre de conversions' },
          ].map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </section>
        <footer className={styles.footer}>
          <span>DocShift © {new Date().getFullYear()}</span>
          <span className={styles.footerDot}>·</span>
          <span>Aucune donnée collectée</span>
          <span className={styles.footerDot}>·</span>
          <span>Open source</span>
        </footer>
      </div>
    </>
  );
}
