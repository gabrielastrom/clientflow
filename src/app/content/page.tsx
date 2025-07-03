"use client";

import * as React from "react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { content as initialContent, clients, teamMembers } from "@/lib/data";
import { type Content } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ExternalLink, PlusCircle, MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

type SortableContentKeys = keyof Omit<Content, 'id' | 'link' | 'description'>;

export default function ContentPage() {
  const [contentList, setContentList] = React.useState<Content[]>(initialContent);
  const [selectedContent, setSelectedContent] = React.useState<Content | null>(null);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [sortConfig, setSortConfig] = React.useState<{ key: SortableContentKeys; direction: 'ascending' | 'descending' } | null>(null);

  const { toast } = useToast();

  const sortedContent = React.useMemo(() => {
    let sortableItems = [...contentList];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue! < bValue!) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue! > bValue!) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [contentList, sortConfig]);

  const requestSort = (key: SortableContentKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: SortableContentKeys) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUp className="ml-2 h-4 w-4 text-primary" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4 text-primary" />;
  };

  const getStatusBadgeClassName = (status: 'To Do' | 'In Progress' | 'In Review' | 'Done') => {
    switch (status) {
      case 'Done':
        return 'bg-green-500/20 text-green-700 border-green-500/20 hover:bg-green-500/30';
      case 'In Progress':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/20 hover:bg-blue-500/30';
      case 'In Review':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/30';
      case 'To Do':
         return 'bg-gray-500/20 text-gray-700 border-gray-500/20 hover:bg-gray-500/30';
      default:
        return '';
    }
  };

  const handleAddSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newContent: Content = {
      id: `${Date.now()}`,
      title: formData.get("title") as string,
      client: formData.get("client") as string,
      status: formData.get("status") as Content["status"],
      platform: formData.get("platform") as Content["platform"],
      deadline: formData.get("deadline") as string,
      owner: formData.get("owner") as string,
      link: formData.get("link") as string || undefined,
      description: formData.get("description") as string || undefined,
    };
    setContentList((prev) => [newContent, ...prev]);
    setIsAddOpen(false);
    toast({ title: "Success", description: "Content item added successfully." });
  };
  
  const handleEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedContent) return;

    const formData = new FormData(event.currentTarget);
    const updatedContent: Content = {
      ...selectedContent,
      title: formData.get("title") as string,
      client: formData.get("client") as string,
      status: formData.get("status") as Content["status"],
      platform: formData.get("platform") as Content["platform"],
      deadline: formData.get("deadline") as string,
      owner: formData.get("owner") as string,
      link: formData.get("link") as string || undefined,
      description: formData.get("description") as string || undefined,
    };

    setContentList(
      contentList.map((c) => (c.id === updatedContent.id ? updatedContent : c))
    );
    setIsEditOpen(false);
    toast({ title: "Success", description: "Content item updated successfully." });
  };
  
  const handleDeleteContent = () => {
    if (!selectedContent) return;
    setContentList(contentList.filter((c) => c.id !== selectedContent.id));
    setIsDeleteAlertOpen(false);
    toast({
      title: "Content Item Deleted",
      description: `"${selectedContent.title}" has been removed.`,
      variant: "destructive",
    });
  };

  return (
    <AppShell>
       <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content</h1>
          <p className="text-muted-foreground">
            Manage all content production for your clients.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Content
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Content Pipeline</CardTitle>
          <CardDescription>
            An overview of all content in different stages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('title')}>
                    Title
                    {getSortIcon('title')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('client')}>
                    Client
                    {getSortIcon('client')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('status')}>
                    Status
                    {getSortIcon('status')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('platform')}>
                    Platform
                    {getSortIcon('platform')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('deadline')}>
                    Deadline
                    {getSortIcon('deadline')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('owner')}>
                    Owner
                    {getSortIcon('owner')}
                  </Button>
                </TableHead>
                <TableHead>Link</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedContent.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.client}</TableCell>
                  <TableCell>
                    <Badge variant={'outline'} className={cn(getStatusBadgeClassName(item.status))}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.platform}</TableCell>
                  <TableCell>{item.deadline}</TableCell>
                  <TableCell>{item.owner}</TableCell>
                  <TableCell>
                    {item.link ? (
                      <Button asChild variant="ghost" size="icon">
                        <Link href={item.link} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                   <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                         <DropdownMenuItem onSelect={() => { setSelectedContent(item); setIsViewOpen(true); }}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => { setSelectedContent(item); setIsEditOpen(true); }}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onSelect={() => { setSelectedContent(item); setIsDeleteAlertOpen(true); }}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add/Edit Dialogs */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => { isAddOpen ? setIsAddOpen(open) : setIsEditOpen(open); if (!open) setSelectedContent(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAddOpen ? "Add New Content" : "Edit Content"}</DialogTitle>
            <DialogDescription>
              {isAddOpen ? "Fill in the details for the new content item." : "Make changes to the content item."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={isAddOpen ? handleAddSubmit : handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input id="title" name="title" defaultValue={selectedContent?.title} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client" className="text-right">Client</Label>
                <Select name="client" defaultValue={selectedContent?.client}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.name}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                 <Select name="status" defaultValue={selectedContent?.status ?? "To Do"}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="To Do">To Do</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="In Review">In Review</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="platform" className="text-right">Platform</Label>
                 <Select name="platform" defaultValue={selectedContent?.platform ?? "Instagram"}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="TikTok">TikTok</SelectItem>
                      <SelectItem value="X">X</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deadline" className="text-right">Deadline</Label>
                <Input id="deadline" name="deadline" type="date" defaultValue={selectedContent?.deadline ?? new Date().toLocaleDateString('en-CA')} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="owner" className="text-right">Owner</Label>
                 <Select name="owner" defaultValue={selectedContent?.owner}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select an owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member} value={member}>{member}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="link" className="text-right">Link</Label>
                <Input id="link" name="link" defaultValue={selectedContent?.link} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">Description</Label>
                <Textarea id="description" name="description" defaultValue={selectedContent?.description} className="col-span-3" placeholder="A short description of the content..." />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit">{isAddOpen ? "Add Content" : "Save Changes"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the content item "{selectedContent?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteContent}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Content Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
            <DialogTitle>{selectedContent?.title}</DialogTitle>
            <DialogDescription>
                {selectedContent?.platform} content for {selectedContent?.client}
            </DialogDescription>
            </DialogHeader>
            {selectedContent && (
            <div className="grid gap-4 py-4 text-sm">
                <div className="grid grid-cols-3 items-center gap-2">
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="col-span-2">
                        <Badge variant={'outline'} className={cn(getStatusBadgeClassName(selectedContent.status))}>
                            {selectedContent.status}
                        </Badge>
                    </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-2">
                    <Label className="text-muted-foreground">Deadline</Label>
                    <p className="col-span-2 font-medium">{selectedContent.deadline}</p>
                </div>
                <div className="grid grid-cols-3 items-center gap-2">
                    <Label className="text-muted-foreground">Owner</Label>
                    <p className="col-span-2 font-medium">{selectedContent.owner}</p>
                </div>
                {selectedContent.description && (
                    <div className="grid grid-cols-3 items-start gap-2">
                        <Label className="text-muted-foreground">Description</Label>
                        <p className="col-span-2 font-medium whitespace-pre-wrap">{selectedContent.description}</p>
                    </div>
                )}
                {selectedContent.link && (
                    <div className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-muted-foreground">Link</Label>
                        <Button asChild variant="link" size="sm" className="p-0 h-auto justify-start col-span-2">
                            <Link href={selectedContent.link} target="_blank" className="truncate">
                                {selectedContent.link}
                                <ExternalLink className="h-3 w-3 ml-1.5" />
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
            )}
            <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">
                Close
                </Button>
            </DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
