import React from 'react';
import styles from './Skeleton.module.css';

export const Skeleton = ({ width = '100%', height = '1rem' }: { width?: string; height?: string }) => {
  return <div className={styles.skeleton} style={{ width, height }} />;
};
