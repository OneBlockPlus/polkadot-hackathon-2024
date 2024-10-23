import {IArticle} from "@/libs/db/dao/article/articleDAO";
import FollowAuthorButton from "@/components/author/FollowAuthorButton";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    User,
    Link, Button
} from "@nextui-org/react";
import {useCallback} from "react";

type DataType = IArticle;

const columns = [
    {name: "Author", uid: "author"},
    {name: "Title", uid: "title"},
    {name: "Preview", uid: "preview"},
    {name: "Action", uid: "action"},
];

interface ArticleTableProps {
    articleList: IArticle[],
}

export default function ArticleTable(props: ArticleTableProps) {
    const renderCell = useCallback((article: DataType, columnKey: React.Key) => {
        const {author, title, content, _id} = article
        const id = _id.toString();
        const author_simple = author.substring(0, 4) + "......" + author.substring(author.length - 4, author.length);

        switch (columnKey) {
            case "author":
                return (
                    <div>
                        <User
                            className="text-white"
                            name="Author"
                            description={author_simple}
                            avatarProps={{
                                src: "https://i.pravatar.cc/150?u=a04258114e29026702d"
                            }}
                            title={author}
                        />
                        <FollowAuthorButton author={author}/>
                    </div>
                );
            case "title":
                return (
                    <div className="flex flex-col">
                        <h4 className="text-white/90 font-medium text-xl">{title}</h4>
                    </div>
                );
            case "preview":
                return (
                    <div className="flex flex-col">
                        <p className="text-tiny text-white/60 uppercase font-bold">{content}</p>
                    </div>
                );
            case "action":
                return (
                    <div className="relative flex items-center gap-2">
                        <Button as={Link} href={"/article/view/" + id}>View</Button>
                        <Button as={Link} href={"/article/edit/" + id}>Edit</Button>
                    </div>
                );
            default:
                return <p>Wrong columnKey</p>;
        }
    }, []);

    return (
        <Table aria-label="Example table with custom cells">
            <TableHeader columns={columns}>
                {(column) => (
                    <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                        {column.name}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody items={props.articleList}>
                {(article: DataType) => (
                    <TableRow key={article._id.toString()}>
                        {(columnKey) => <TableCell>{renderCell(article, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}