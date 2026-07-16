import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Rocket, FolderKanban, Music, UploadCloud, Calendar, BarChart2, PieChart, Settings } from "lucide-react";

export default function Layout({ onLogout }: { onLogout?: () => void }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground">
      <Sidebar onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-background/50">
          <div className="px-5 py-6 md:px-8 md:py-8 max-w-screen-2xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/mission-control"))}>
              <Rocket className="mr-2 h-4 w-4" />
              <span>Mission Control</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/projects"))}>
              <FolderKanban className="mr-2 h-4 w-4" />
              <span>Projects</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/beat-library"))}>
              <Music className="mr-2 h-4 w-4" />
              <span>Beat Library</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/publishing"))}>
              <UploadCloud className="mr-2 h-4 w-4" />
              <span>Publishing</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/calendar"))}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Content Calendar</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Reviews">
            <CommandItem onSelect={() => runCommand(() => navigate("/weekly-review"))}>
              <BarChart2 className="mr-2 h-4 w-4" />
              <span>Weekly Review</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/monthly-review"))}>
              <PieChart className="mr-2 h-4 w-4" />
              <span>Monthly Review</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
