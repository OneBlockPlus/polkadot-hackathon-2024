import { getDB } from "@/background/db";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SettingPage = () => {
  const navigate = useNavigate();
  const logoutMutation = useMutation({
    mutationKey: ["logout"],
    mutationFn: async () => {
      const db = await getDB();
      await db.accounts.clear();
    },
    onSuccess: () => {
      navigate("/welcome");
    },
  });

  return (
    <Layout type="back" title="Settings">
      <div className="p-4 h-full flex flex-col">
        <div className="flex flex-col gap-3 mb-8">
          <div
            className="border-t border-b p-4 cursor-pointer flex items-center"
            onClick={() => navigate("/expire")}
          >
            <div className="text-base font-medium select-none">Expire Time</div>
            <div className="text-muted-foreground ml-auto">
              <ChevronRight />
            </div>
          </div>
        </div>
        <div className="mt-auto">
          <Button
            onClick={() => logoutMutation.mutateAsync()}
            disabled={logoutMutation.isPending}
            variant="destructive"
            className="w-full select-none"
          >
            Log out
          </Button>
        </div>
      </div>
    </Layout>
  );
};
