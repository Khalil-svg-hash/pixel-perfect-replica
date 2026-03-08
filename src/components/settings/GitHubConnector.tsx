import { useState } from "react";
import { Github, Check, ChevronRight, Plus, GitBranch, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Step = "authorize" | "select-account" | "select-repo";

interface Account {
  id: string;
  login: string;
  type: "User" | "Organization";
}

interface Repo {
  id: string;
  name: string;
  fullName: string;
  private: boolean;
  updatedAt: string;
}

const MOCK_ACCOUNTS: Account[] = [
  { id: "1", login: "your-username", type: "User" },
  { id: "2", login: "your-org", type: "Organization" },
];

const MOCK_REPOS: Repo[] = [
  { id: "1", name: "my-project", fullName: "your-username/my-project", private: false, updatedAt: "2 days ago" },
  { id: "2", name: "private-repo", fullName: "your-username/private-repo", private: true, updatedAt: "1 week ago" },
  { id: "3", name: "awesome-app", fullName: "your-username/awesome-app", private: false, updatedAt: "3 weeks ago" },
];

interface ConnectionState {
  connected: boolean;
  account: Account | null;
  repo: Repo | null;
}

export function GitHubConnector() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("authorize");
  const [authorized, setAuthorized] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [connection, setConnection] = useState<ConnectionState>({
    connected: false,
    account: null,
    repo: null,
  });
  const [newRepoName, setNewRepoName] = useState("");
  const [repoMode, setRepoMode] = useState<"new" | "existing">("existing");

  const openDialog = () => {
    setStep(authorized ? "select-account" : "authorize");
    setOpen(true);
  };

  const handleAuthorize = () => {
    setAuthorized(true);
    setStep("select-account");
  };

  const handleSelectAccount = (account: Account) => {
    setSelectedAccount(account);
    setStep("select-repo");
  };

  const handleConnectRepo = (repo: Repo) => {
    setConnection({ connected: true, account: selectedAccount, repo });
    setOpen(false);
  };

  const handleCreateRepo = () => {
    if (!newRepoName.trim()) return;
    const newRepo: Repo = {
      id: crypto.randomUUID(),
      name: newRepoName.trim(),
      fullName: `${selectedAccount?.login}/${newRepoName.trim()}`,
      private: false,
      updatedAt: "just now",
    };
    setConnection({ connected: true, account: selectedAccount, repo: newRepo });
    setOpen(false);
  };

  const handleDisconnect = () => {
    setConnection({ connected: false, account: null, repo: null });
    setAuthorized(false);
    setSelectedAccount(null);
    setNewRepoName("");
    setRepoMode("existing");
  };

  const handleDialogClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setNewRepoName("");
    }
  };

  return (
    <>
      <div className="px-4 py-4">
        {connection.connected ? (
          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <div className="h-9 w-9 rounded-lg bg-foreground flex items-center justify-center shrink-0">
              <Github className="h-5 w-5 text-background" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-semibold">GitHub connected</p>
              <p className="text-body-xs text-muted-foreground mt-0.5 truncate">
                {connection.repo?.fullName}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Check className="h-3.5 w-3.5 text-green-500" />
                <span className="text-[11px] text-green-600 dark:text-green-400 font-medium">Connected</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={openDialog}>
                Change
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDisconnect}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <div className="h-9 w-9 rounded-lg bg-foreground flex items-center justify-center shrink-0">
              <Github className="h-5 w-5 text-background" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-semibold">GitHub</p>
              <p className="text-body-xs text-muted-foreground mt-0.5">
                Connect your project to a GitHub repository to sync your code.
              </p>
            </div>
            <Button size="sm" onClick={openDialog} className="shrink-0">
              Connect project
            </Button>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          {step === "authorize" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  Connect to GitHub
                </DialogTitle>
                <DialogDescription>
                  Authorize the Lovable GitHub App to connect your project to a repository.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="rounded-lg border border-border p-4 space-y-3">
                  <p className="text-body-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    The app will be able to:
                  </p>
                  <ul className="space-y-2">
                    {[
                      "Read and write repository contents",
                      "Create and manage repositories",
                      "Read repository metadata",
                    ].map((permission) => (
                      <li key={permission} className="flex items-center gap-2 text-body-sm">
                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                        {permission}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button className="w-full" onClick={handleAuthorize}>
                  <Github className="h-4 w-4" />
                  Authorize Lovable GitHub App
                </Button>
              </div>
            </>
          )}

          {step === "select-account" && (
            <>
              <DialogHeader>
                <DialogTitle>Select account or organization</DialogTitle>
                <DialogDescription>
                  Choose the GitHub account or organization where you want to connect your project.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 pt-2">
                {MOCK_ACCOUNTS.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => handleSelectAccount(account)}
                    className="flex items-center gap-3 w-full rounded-lg border border-border px-4 py-3 hover:bg-muted/50 transition-colors text-start"
                  >
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <span className="text-body-xs font-bold uppercase">
                        {account.login.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-medium truncate">{account.login}</p>
                      <p className="text-body-xs text-muted-foreground">{account.type}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "select-repo" && (
            <>
              <DialogHeader>
                <DialogTitle>Select repository</DialogTitle>
                <DialogDescription>
                  Create a new repository or connect to an existing one under{" "}
                  <span className="font-medium text-foreground">{selectedAccount?.login}</span>.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div className="flex rounded-lg border border-border p-1 gap-1">
                  <button
                    onClick={() => setRepoMode("existing")}
                    className={cn(
                      "flex-1 rounded-md px-3 py-1.5 text-body-xs font-medium transition-colors",
                      repoMode === "existing"
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Existing repo
                  </button>
                  <button
                    onClick={() => setRepoMode("new")}
                    className={cn(
                      "flex-1 rounded-md px-3 py-1.5 text-body-xs font-medium transition-colors",
                      repoMode === "new"
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    New repo
                  </button>
                </div>

                {repoMode === "existing" ? (
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {MOCK_REPOS.map((repo) => (
                      <button
                        key={repo.id}
                        onClick={() => handleConnectRepo(repo)}
                        className="flex items-center gap-3 w-full rounded-lg border border-border px-3 py-2.5 hover:bg-muted/50 transition-colors text-start"
                      >
                        <GitBranch className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-body-sm font-medium truncate">{repo.name}</p>
                          <p className="text-body-xs text-muted-foreground">
                            {repo.private ? "Private" : "Public"} · Updated {repo.updatedAt}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-body-xs font-medium text-muted-foreground block mb-1.5">
                        Repository name
                      </label>
                      <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-body-sm">
                        <span className="text-muted-foreground shrink-0">{selectedAccount?.login}/</span>
                        <input
                          type="text"
                          placeholder="my-project"
                          value={newRepoName}
                          onChange={(e) => setNewRepoName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleCreateRepo()}
                          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleCreateRepo}
                      disabled={!newRepoName.trim()}
                    >
                      <Plus className="h-4 w-4" />
                      Create repository
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
