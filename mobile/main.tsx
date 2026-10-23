import React from 'react';
import {createRoot} from 'react-dom/client';
import {AppTheme} from '../components/theme-toggle';
import LearningApp from '../components/learning-app';
import {initializeNative} from '../lib/native-app';
import '../app/globals.css';
await initializeNative();
createRoot(document.getElementById('root')!).render(<AppTheme><LearningApp/></AppTheme>);
