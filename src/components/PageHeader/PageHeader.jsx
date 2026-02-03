import sharedStyles from '../../styles/shared.module.css';

export function PageHeader({ title, subtitle }) {
  return (
    <header className={sharedStyles.pageHeader}>
      <h1 className={sharedStyles.pageTitle}>{title}</h1>
      <p className={sharedStyles.pageSubtitle}>{subtitle}</p>
    </header>
  );
}
