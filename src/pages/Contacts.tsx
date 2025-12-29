import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactList } from '../components/ContactList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const Contacts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => !prev);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="md:flex md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Contacts</CardTitle>
            <CardDescription>Manage contact messages from users</CardDescription>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-8 w-full md:w-64"
              />
            </div>
            <Button variant="outline" onClick={handleRefresh}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ContactList refreshTrigger={refreshTrigger} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Contacts;