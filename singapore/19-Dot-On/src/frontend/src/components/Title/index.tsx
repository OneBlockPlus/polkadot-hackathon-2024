import styles from "./index.module.less";

type Props = {
	title: string;
};

export const Title = (props: Props) => {
	return <div className={styles.title}>{props.title}</div>;
};
