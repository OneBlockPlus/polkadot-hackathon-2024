import { Container } from '../container';
import { Logo } from '../logo';

import { LIST } from './consts';
import styles from './footer.module.scss';

function Footer() {
  const currentYear = new Date().getFullYear();

  const getLinks = (links: (typeof LIST)[number]['links']) =>
    links.map(({ text, href }) => (
      <li key={text} className={styles.link}>
        <a target="_blank" rel="noreferrer" href={href}>
          {text}
        </a>
      </li>
    ));

  const getList = () =>
    LIST.map(({ heading, links }) => (
      <li key={heading}>
        <h3 className={styles.heading}>{heading}</h3>
        <ul>{getLinks(links)}</ul>
      </li>
    ));

  return (
    <footer className={styles.footer}>
      <Container className={styles.container}>
        <div className={styles.brand}>
          <Logo large />
          <small>&copy; {currentYear} 6Sigma_Labs, Inc. All Rights Reserved.</small>
        </div>

        <ul className={styles.list}>{getList()}</ul>
      </Container>
    </footer>
  );
}

export { Footer };
