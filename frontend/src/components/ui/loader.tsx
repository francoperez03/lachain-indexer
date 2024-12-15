import React from 'react';
import './loader.css';
import {Loader as Loaderpi} from 'lucide-react'

const Loader: React.FC<{ className?: string; size?: number }> = () => (
  <Loaderpi className='loader-icon' />
);

export default Loader;
