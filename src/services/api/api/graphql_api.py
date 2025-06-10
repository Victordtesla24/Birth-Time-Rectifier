from typing import Dict, Any, List, Optional
import strawberry
from strawberry.fastapi import GraphQLRouter
from strawberry.subscriptions import BaseSubscription
from fastapi import FastAPI, Security
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from datetime import datetime, timedelta
from ..models.user import User
from ..models.birth_data import BirthData
from ..models.rectification_result import RectificationResult
from ..utils.analytics import APIAnalytics
from ..utils.rate_limiter import RateLimiter
from ..utils.api_versioning import APIVersionManager

# GraphQL Types
@strawberry.type
class BirthDataType:
    date: str
    time: str
    latitude: float
    longitude: float
    timezone: str

@strawberry.type
class RectificationResultType:
    rectified_time: str
    confidence_score: float
    planetary_positions: Dict[str, float]
    element_balance: Dict[str, float]

@strawberry.type
class UserType:
    id: str
    username: str
    email: str
    subscription_level: str

# GraphQL Mutations
@strawberry.type
class Mutation:
    @strawberry.mutation
    async def rectify_birth_time(
        self,
        birth_data: BirthDataType,
        info: strawberry.types.Info
    ) -> RectificationResultType:
        # Validate user access
        user = await get_current_user(info.context)
        if not user:
            raise Exception("Unauthorized")
            
        # Rate limiting check
        if not rate_limiter.check_limit(user.id):
            raise Exception("Rate limit exceeded")
            
        # Process rectification
        result = await process_rectification(birth_data)
        
        # Log analytics
        analytics.log_api_call(
            user.id,
            "rectify_birth_time",
            {"birth_data": birth_data}
        )
        
        return result

# GraphQL Queries
@strawberry.type
class Query:
    @strawberry.field
    async def get_user(
        self,
        info: strawberry.types.Info
    ) -> UserType:
        user = await get_current_user(info.context)
        if not user:
            raise Exception("Unauthorized")
        return user
    
    @strawberry.field
    async def get_rectification_history(
        self,
        info: strawberry.types.Info
    ) -> List[RectificationResultType]:
        user = await get_current_user(info.context)
        if not user:
            raise Exception("Unauthorized")
            
        history = await get_user_history(user.id)
        return history

# WebSocket Subscriptions
@strawberry.type
class Subscription(BaseSubscription):
    @strawberry.subscription
    async def rectification_progress(
        self,
        info: strawberry.types.Info
    ) -> AsyncGenerator[Dict[str, Any], None]:
        user = await get_current_user(info.context)
        if not user:
            raise Exception("Unauthorized")
            
        async for progress in progress_tracker.subscribe(user.id):
            yield progress

# API Setup
app = FastAPI(title="Birth Time Rectifier API")
version_manager = APIVersionManager()
analytics = APIAnalytics()
rate_limiter = RateLimiter()

# Security setup
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
SECRET_KEY = "your-secret-key"  # Move to environment variables
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GraphQL schema and router
schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    subscription=Subscription
)

graphql_app = GraphQLRouter(
    schema,
    path="/graphql",
    subscription_protocols=["graphql-ws", "graphql-transport-ws"]
)

app.include_router(graphql_app)

# Security functions
async def get_current_user(
    token: str = Security(oauth2_scheme)
) -> Optional[User]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return await get_user_by_id(user_id)
    except JWTError:
        return None

def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# API version routes
@app.get("/api/versions")
async def get_api_versions():
    return version_manager.get_versions()

@app.get("/api/docs/{version}")
async def get_api_docs(version: str):
    return version_manager.get_documentation(version)

# Analytics routes
@app.get("/api/analytics")
async def get_api_analytics(
    current_user: User = Security(get_current_user)
):
    if current_user.subscription_level != "admin":
        raise Exception("Unauthorized")
    return analytics.get_analytics_data()

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": version_manager.get_current_version(),
        "timestamp": datetime.utcnow()
    }

# Error handling
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return {
        "error": str(exc),
        "timestamp": datetime.utcnow(),
        "path": request.url.path
    }

# Utility functions
async def process_rectification(
    birth_data: BirthDataType
) -> RectificationResultType:
    """Process birth time rectification request."""
    # Implement rectification logic
    return RectificationResultType(
        rectified_time="",
        confidence_score=0.0,
        planetary_positions={},
        element_balance={}
    )

async def get_user_by_id(user_id: str) -> Optional[User]:
    """Get user by ID from database."""
    # Implement user retrieval logic
    return None

async def get_user_history(user_id: str) -> List[RectificationResultType]:
    """Get user's rectification history."""
    # Implement history retrieval logic
    return []

# WebSocket progress tracker
class ProgressTracker:
    def __init__(self):
        self.subscribers = {}
    
    async def subscribe(self, user_id: str):
        """Subscribe to progress updates."""
        if user_id not in self.subscribers:
            self.subscribers[user_id] = set()
        # Implement subscription logic
        yield {"progress": 0} 