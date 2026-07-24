import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Bio from "@/pages/Bio";
import Protocol from "@/pages/Protocol";
import Testimonials from "@/pages/Testimonials";
import Science from "@/pages/Science";
import Intel from "@/pages/Intel";
import ComputeCore from "@/pages/ComputeCore";
import SampleReports from "@/pages/SampleReports";
import Assessment from "@/pages/Assessment";
import PeerAssessment from "@/pages/PeerAssessment";
import TeamDashboard from "@/pages/TeamDashboard";
import ManagerGuidebook from "@/pages/ManagerGuidebook";
import AlignmentResults from "@/pages/AlignmentResults";
import Journey from "@/pages/Journey";
import TeamBuilder from "@/pages/TeamBuilder";
import AlphaInvite from "@/pages/AlphaInvite";
import AlphaFeedback from "@/pages/AlphaFeedback";
import ShareResults from "@/pages/ShareResults";
import TeamSettings from "@/pages/TeamSettings";
import TeamMapPage from "@/pages/TeamMapPage";
import FamilyDynamic from "@/pages/FamilyDynamic";
import ThreeSixtyResults from "@/pages/ThreeSixtyResults";
import AdminDashboard from "@/pages/AdminDashboard";
import Pricing from "@/pages/Pricing";
import TeamComparison from "@/pages/TeamComparison";
import WhiteLabel from "@/pages/WhiteLabel";
import Coaching from "@/pages/Coaching";
import InvestorMetrics from "@/pages/InvestorMetrics";
import Integrations from "@/pages/Integrations";
import Inspirations from "@/pages/Inspirations";
import SoulPrint from "@/pages/SoulPrint";
import OriginStory from "@/pages/OriginStory";
import WhyTeamsFail from "@/pages/WhyTeamsFail";
import CombinedReport from "@/pages/CombinedReport";
import RelationshipCalculator from "@/pages/RelationshipCalculator";
import ConductorPlaybook from "@/pages/ConductorPlaybook";
import EnterpriseDashboard from "@/pages/EnterpriseDashboard";
import MAPlaybook from "@/pages/MAPlaybook";
import MagicQuestions from "@/pages/MagicQuestions";
import CredibilityTimeline from "@/pages/CredibilityTimeline";
import FindYourPath from "@/pages/FindYourPath";
import ShareCard from "@/pages/ShareCard";
import MyJourney from "@/pages/MyJourney";
import DeepCalibration from "@/pages/DeepCalibration";
import EfficacyReport from "@/pages/EfficacyReport";
import ResearchDashboard from "@/pages/ResearchDashboard";
import SoulPrintLayer from "@/pages/SoulPrintLayer";
import ReportsDashboard from "@/pages/ReportsDashboard";
import ThreeSixtyReview from "@/pages/ThreeSixtyReview";
import Family360Review from "@/pages/Family360Review";
import TribeTrial from "@/pages/TribeTrial";
import TeamProfile from "@/pages/TeamProfile";
import Navbar from "@/components/Navbar";
import FloatingCTA from "@/components/FloatingCTA";
import EcosystemFooter from "@/components/EcosystemFooter";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/bio" component={Bio} />
      <Route path="/protocol" component={Protocol} />
      <Route path="/testimonials" component={Testimonials} />
      <Route path="/science" component={Science} />
      <Route path="/intel" component={Intel} />
      <Route path="/compute-core" component={ComputeCore} />
      <Route path="/sample-reports" component={SampleReports} />
      <Route path="/assessment" component={Assessment} />
      <Route path="/peer-assessment" component={PeerAssessment} />
      <Route path="/peer-review/:token" component={PeerAssessment} />
      <Route path="/team-dashboard" component={TeamDashboard} />
      <Route path="/manager-guidebook" component={ManagerGuidebook} />
      <Route path="/results" component={AlignmentResults} />
      <Route path="/journey" component={Journey} />
      <Route path="/team-builder" component={TeamBuilder} />
      <Route path="/alpha" component={AlphaInvite} />
      <Route path="/feedback" component={AlphaFeedback} />
      <Route path="/share" component={ShareResults} />
      <Route path="/team-settings" component={TeamSettings} />
      <Route path="/team-map" component={TeamMapPage} />
      <Route path="/family" component={FamilyDynamic} />
      <Route path="/360/:token" component={ThreeSixtyReview} />
      <Route path="/family-360/:token" component={Family360Review} />
      <Route path="/360-results/:assessmentId" component={ThreeSixtyResults} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/team-comparison" component={TeamComparison} />
      <Route path="/white-label" component={WhiteLabel} />
      <Route path="/coaching" component={Coaching} />
      <Route path="/investor-metrics" component={InvestorMetrics} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/inspirations" component={Inspirations} />
      <Route path="/soulprint" component={SoulPrint} />
      <Route path="/soulprint/report/:orderId" component={SoulPrint} />
      <Route path="/origin-story" component={OriginStory} />
      <Route path="/why-teams-fail" component={WhyTeamsFail} />
      <Route path="/combined-report" component={CombinedReport} />
      <Route path="/relationship-calculator" component={RelationshipCalculator} />
      <Route path="/conductor-playbook" component={ConductorPlaybook} />
      <Route path="/enterprise-dashboard" component={EnterpriseDashboard} />
      <Route path="/ma-playbook" component={MAPlaybook} />
      <Route path="/magic-questions" component={MagicQuestions} />
      <Route path="/credibility-timeline" component={CredibilityTimeline} />
      <Route path="/find-your-path" component={FindYourPath} />
      <Route path="/share-card" component={ShareCard} />
      <Route path="/my-journey" component={MyJourney} />
      <Route path="/deep-calibration" component={DeepCalibration} />
      <Route path="/efficacy" component={EfficacyReport} />
      <Route path="/research" component={ResearchDashboard} />
      <Route path="/consciousness" component={SoulPrintLayer} />
      <Route path="/consciousness/:assessmentId" component={SoulPrintLayer} />
      <Route path="/reports" component={ReportsDashboard} />
      <Route path="/tribe-trial" component={TribeTrial} />
      <Route path="/team/:domain" component={TeamProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

import { useEffect } from "react";

function App() {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'u', 's', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <Navbar />
      <Router />
      <FloatingCTA />
      <EcosystemFooter />
    </>
  );
}

export default App;
