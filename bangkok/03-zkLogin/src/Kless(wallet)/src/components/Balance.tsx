import { Button } from '@/components/ui/button';
import { Bitcoin, ChevronRight } from 'lucide-react';

export const Balance = ({ className }: { className?: string }) => {
  return (
    <div
      className={`flex items-center justify-between py-3 border-b ${className}`}
    >
      <div className="flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-4 bg-sky-200 rounded-full p-1">
          <Bitcoin color="white" />
        </div>
        <div>
          <p className="text-sm font-medium leading-none">DOT</p>
          <p className="text-sm text-muted-foreground">10.8</p>
        </div>
      </div>
      <div>$ 10.8</div>
      <div className="flex items-center">
        <Button variant="ghost">Send</Button>
        <ChevronRight className="text-gray-400" strokeWidth={1.5}/>
      </div>
    </div>
  );
};
