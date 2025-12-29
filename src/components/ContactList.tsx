import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { 
  getAllContacts, 
  getContactById, 
  deleteContact,
  ContactApiResponseWithPagination
} from '../services/contactService';
import { Contact } from '../interfaces';
import { toast } from 'sonner';

interface ContactListProps {
  refreshTrigger?: boolean;
}

export const ContactList: React.FC<ContactListProps> = ({ refreshTrigger }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response: ContactApiResponseWithPagination = await getAllContacts({ page, limit: 10 });
      
      if (response.success && response.data) {
        setContacts(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.total_pages);
          setTotalContacts(response.pagination.total);
        }
      } else {
        toast.error(response.message || 'Failed to fetch contacts');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [page, refreshTrigger]);

  const handleViewDetail = async (contactId: number) => {
    try {
      const response = await getContactById(contactId);
      
      if (response.success && response.data) {
        setSelectedContact(response.data);
        setIsDetailOpen(true);
      } else {
        toast.error(response.message || 'Failed to fetch contact details');
      }
    } catch (error) {
      console.error('Error fetching contact details:', error);
      toast.error('Failed to fetch contact details');
    }
  };

  const handleDeleteClick = (contactId: number) => {
    setContactToDelete(contactId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (contactToDelete === null) return;

    try {
      const response = await deleteContact(contactToDelete);
      
      if (response.success) {
        toast.success('Contact deleted successfully');
        setContacts(prev => prev.filter(contact => contact.contact_id !== contactToDelete));
        setTotalContacts(prev => prev - 1);
      } else {
        toast.error(response.message || 'Failed to delete contact');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    } finally {
      setIsDeleteDialogOpen(false);
      setContactToDelete(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Contact Messages</h2>
        <p className="text-sm text-muted-foreground">
          Showing {contacts.length} of {totalContacts} messages
        </p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <TableRow key={contact.contact_id}>
                  <TableCell className="font-medium">{contact.contact_id}</TableCell>
                  <TableCell className="max-w-xs truncate">{contact.title}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{formatDate(contact.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(contact.contact_id!)}
                      >
                        View
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(contact.contact_id!)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No contact messages found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
                <p>{selectedContact.contact_id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
                <p>{selectedContact.title}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p>{selectedContact.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Message</h3>
                <p className="whitespace-pre-wrap">{selectedContact.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                  <p>{formatDate(selectedContact.created_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Updated At</h3>
                  <p>{formatDate(selectedContact.updated_at)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contact message.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};