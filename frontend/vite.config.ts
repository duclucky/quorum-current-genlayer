import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import {rpcHandler} from './server/rpc.ts';
export default defineConfig({
  plugins: [react(),{name:'canonical-ic-rpc',configureServer(server){server.middlewares.use('/genlayer-rpc',(req,res)=>{void rpcHandler(req,res);});},configurePreviewServer(server){server.middlewares.use('/genlayer-rpc',(req,res)=>{void rpcHandler(req,res);});}}],
  test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test-setup.ts'] },
});
