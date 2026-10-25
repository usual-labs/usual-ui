import { createRoot } from 'react-dom/client';
import { App } from './App';
import '@fontsource-variable/manrope';
import './styles.css';
import './onboarding.css';
import './showcase.css';
import './preview-gallery.css';
import './preview-studio.css';
import './theme-inspector.css';
import './business-samples.css';
import './business-shell.css';
import './business-context.css';
import './message-samples.css';
import './component-samples.css';

const root = document.getElementById('root');
if (!root) throw new Error('The wizard root could not be found.');
createRoot(root).render(<App />);
