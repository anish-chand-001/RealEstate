import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import propertyRouter from './routes/property.routes.js';
import inquiryRouter from './routes/inquiry.routes.js'
import wishlistRouter from './routes/wishlist.routes.js';
import contactRouter from './routes/contact.routes.js';
import adminRouter from './routes/admin.routes.js';
import chatRouter from './routes/chat.routes.js';


const app = express();

// Configure only the known proxy hop count so IP-based throttling uses the client IP safely.
const trustedProxyHops = Number.parseInt(process.env.TRUST_PROXY_HOPS || "0", 10);
if (Number.isInteger(trustedProxyHops) && trustedProxyHops >= 0) {
  app.set("trust proxy", trustedProxyHops);
}

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Swagger UI Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/property',propertyRouter)
app.use('/api/inquiry',inquiryRouter)
app.use('/api/wishlist',wishlistRouter)
app.use('/api/contact',contactRouter)
app.use('/api/chat',chatRouter)
app.use('/api/admin',adminRouter)

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'Real Estate API is actively running.' 
  });
});

app.use((err, req, res, next) => {
  const status = err.status || (err.name === 'MulterError' ? 400 : 500);
  console.error(err);
  res.status(status).json({
    success: false,
    error: status >= 500 ? 'Server Error' : err.message,
  });
});

export default app;