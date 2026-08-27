#!/usr/bin/env python3
"""
Setup script for Composio Kaggle MCP integration
Run this to generate the MCP URL for Claude Code
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.kaggle')

COMPOSIO_API_KEY = os.getenv('COMPOSIO_API_KEY')
CLAUDE_CODE_USER_ID = os.getenv('CLAUDE_CODE_USER_ID')

if not COMPOSIO_API_KEY or COMPOSIO_API_KEY == 'your_composio_api_key_here':
    print("❌ ERROR: COMPOSIO_API_KEY not configured")
    print("")
    print("📝 To complete setup:")
    print("   1. Visit: https://composio.dev/")
    print("   2. Sign up and get your API key")
    print("   3. Edit .env.kaggle file with your credentials")
    print("   4. Run this script again")
    sys.exit(1)

if not CLAUDE_CODE_USER_ID or CLAUDE_CODE_USER_ID == 'your_user_id_here':
    print("❌ ERROR: CLAUDE_CODE_USER_ID not configured")
    print("")
    print("📝 To complete setup:")
    print("   1. Get your user ID from Composio dashboard")
    print("   2. Edit .env.kaggle file")
    print("   3. Run this script again")
    sys.exit(1)

# Try to import and test Composio
try:
    from composio import Composio
    print("✅ Composio library imported successfully")
    
    # Create session
    print("\n🔄 Creating Composio session...")
    composio_client = Composio(api_key=COMPOSIO_API_KEY)
    session = composio_client.create(
        user_id=CLAUDE_CODE_USER_ID,
        toolkits=["kaggle"]
    )
    
    mcp_url = session.mcp.url
    
    print(f"✅ Session created successfully!")
    print(f"\n📊 MCP Configuration:")
    print(f"   MCP URL: {mcp_url}")
    print(f"   API Key: {COMPOSIO_API_KEY[:20]}...")
    
    print(f"\n📋 Next step - Register MCP with Claude Code:")
    print(f"""
   cd {os.getcwd()}
   claude mcp add --transport http kaggle-composio "{mcp_url}" \
     --headers "X-API-Key:{COMPOSIO_API_KEY}"
   
   # Then restart Claude Code:
   exit
   claude
    """)
    
except ImportError:
    print("⚠️ Composio library not installed yet")
    print("   Run: python3 -m pip install composio-core")
except Exception as e:
    print(f"⚠️ Error: {str(e)}")
    print("   Check your API credentials in .env.kaggle")

