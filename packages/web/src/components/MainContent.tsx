import { UserType } from '../models/User';
import RestoreInstanceContent from './restore/RestoreInstanceContent';
import SnapshotInstanceContent from './snapshot/SnapshotInstanceContent';
import StartInstanceContent from './start/StartInstanceContent';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MainContentProps {
  user: UserType;
}

const MainContent = (props: MainContentProps) => {
  if (import.meta.env.VITE_SHOW_SNAPSHOT_RESTORE === '1') {
    return (
      <Tabs defaultValue="start" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="start" data-testid="start">
            Start an Instance
          </TabsTrigger>
          <TabsTrigger value="snapshot" data-testid="snapshot">
            Snapshot an Instance
          </TabsTrigger>
          <TabsTrigger value="restore">Restore an Instance</TabsTrigger>
        </TabsList>
        <TabsContent value="start">
          <StartInstanceContent user={props.user} />
        </TabsContent>
        <TabsContent value="snapshot">
          <SnapshotInstanceContent />
        </TabsContent>
        <TabsContent value="restore">
          <RestoreInstanceContent />
        </TabsContent>
      </Tabs>
    );
  } else {
    return <StartInstanceContent user={props.user} />;
  }
};

export default MainContent;
