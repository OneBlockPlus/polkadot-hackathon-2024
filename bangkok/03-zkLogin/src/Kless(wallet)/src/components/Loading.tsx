import CircularProgress from "@mui/joy/CircularProgress";

export const Loading = ({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) => {
  return loading ? (
    <div className="flex justify-center items-center h-full">
      <CircularProgress />
    </div>
  ) : (
    <>{children}</>
  );
};
