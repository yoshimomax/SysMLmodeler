import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import DiagramEditor from "@/pages/DiagramEditor";

function Router() {
  return (
    <>
      <nav className="main-nav">
        <ul>
          <li><Link href="/">ホーム</Link></li>
          <li><Link href="/diagram">SysML v2 エディタ</Link></li>
        </ul>
      </nav>
      <Switch>
        <Route path="/" component={Home}/>
        <Route path="/diagram" component={DiagramEditor}/>
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
      <style jsx>{`
        .main-nav {
          background-color: #2c3e50;
          padding: 10px 20px;
        }
        
        .main-nav ul {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        
        .main-nav li {
          margin-right: 20px;
        }
        
        .main-nav a {
          color: white;
          text-decoration: none;
          font-weight: 500;
          padding: 5px 0;
        }
        
        .main-nav a:hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
