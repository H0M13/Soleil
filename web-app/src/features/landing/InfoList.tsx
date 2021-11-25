import styles from './landing.module.css';

const InfoList = ({items, offset = 0, emoji} : { items: string[], offset?: number, emoji ?: string }) => {
  return (
    <div className={styles.howTo}>
      {
        items.map((text, index) => (
          <div className={styles.howToRow}>
            <div className={styles.howToNumber}><div>{emoji || index + offset}</div></div>
            <div>
              { text }
            </div>
          </div>
        ))
      }
    </div>
  );
}

export default InfoList;