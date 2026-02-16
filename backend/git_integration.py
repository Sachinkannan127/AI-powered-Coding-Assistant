"""
GitHub Integration for automated Pull Requests
"""

import os
from typing import Dict, List, Optional
import httpx
from datetime import datetime


class GitHubIntegration:
    """
    Automate GitHub operations including PR creation
    """
    
    def __init__(self):
        self.token = os.getenv("GITHUB_TOKEN")
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json"
        }
    
    async def create_pull_request(
        self,
        repo: str,
        title: str,
        description: str,
        head_branch: str,
        base_branch: str = "main",
        code_changes: Optional[Dict[str, str]] = None
    ) -> Dict:
        """
        Create a pull request on GitHub
        
        Args:
            repo: Repository name (e.g., "username/repo")
            title: PR title
            description: PR description
            head_branch: Source branch
            base_branch: Target branch (default: main)
            code_changes: Dict of {file_path: content}
        
        Returns:
            PR information
        """
        
        if code_changes:
            # First, create or update files
            await self._commit_files(repo, head_branch, code_changes)
        
        # Create pull request
        url = f"{self.base_url}/repos/{repo}/pulls"
        
        data = {
            "title": title,
            "body": description,
            "head": head_branch,
            "base": base_branch
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=self.headers, json=data)
            response.raise_for_status()
            
            pr_data = response.json()
            
            return {
                "number": pr_data["number"],
                "url": pr_data["html_url"],
                "state": pr_data["state"],
                "created_at": pr_data["created_at"]
            }
    
    async def _commit_files(
        self,
        repo: str,
        branch: str,
        files: Dict[str, str],
        commit_message: str = "AI-generated code updates"
    ):
        """
        Commit files to a repository branch
        """
        async with httpx.AsyncClient() as client:
            for file_path, content in files.items():
                # Get file SHA if it exists (for updates)
                url = f"{self.base_url}/repos/{repo}/contents/{file_path}?ref={branch}"
                
                try:
                    response = await client.get(url, headers=self.headers)
                    existing_file = response.json()
                    sha = existing_file.get("sha")
                except:
                    sha = None
                
                # Create or update file
                url = f"{self.base_url}/repos/{repo}/contents/{file_path}"
                
                import base64
                encoded_content = base64.b64encode(content.encode()).decode()
                
                data = {
                    "message": commit_message,
                    "content": encoded_content,
                    "branch": branch
                }
                
                if sha:
                    data["sha"] = sha
                
                response = await client.put(url, headers=self.headers, json=data)
                response.raise_for_status()
    
    async def get_pull_requests(
        self,
        repo: str,
        state: str = "open"
    ) -> List[Dict]:
        """
        Get pull requests for a repository
        """
        url = f"{self.base_url}/repos/{repo}/pulls"
        params = {"state": state}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            
            return response.json()
    
    async def create_branch(
        self,
        repo: str,
        branch_name: str,
        from_branch: str = "main"
    ) -> Dict:
        """
        Create a new branch
        """
        async with httpx.AsyncClient() as client:
            # Get the SHA of the from_branch
            url = f"{self.base_url}/repos/{repo}/git/refs/heads/{from_branch}"
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            sha = response.json()["object"]["sha"]
            
            # Create new branch
            url = f"{self.base_url}/repos/{repo}/git/refs"
            data = {
                "ref": f"refs/heads/{branch_name}",
                "sha": sha
            }
            
            response = await client.post(url, headers=self.headers, json=data)
            response.raise_for_status()
            
            return response.json()
    
    async def add_pr_comment(
        self,
        repo: str,
        pr_number: int,
        comment: str
    ):
        """
        Add a comment to a pull request
        """
        url = f"{self.base_url}/repos/{repo}/issues/{pr_number}/comments"
        data = {"body": comment}
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=self.headers, json=data)
            response.raise_for_status()
            
            return response.json()


class GitLabIntegration:
    """
    GitLab integration for merge requests
    """
    
    def __init__(self):
        self.token = os.getenv("GITLAB_TOKEN")
        self.base_url = os.getenv("GITLAB_URL", "https://gitlab.com")
        self.headers = {
            "PRIVATE-TOKEN": self.token
        }
    
    async def create_merge_request(
        self,
        project_id: str,
        title: str,
        description: str,
        source_branch: str,
        target_branch: str = "main"
    ) -> Dict:
        """
        Create a merge request on GitLab
        """
        url = f"{self.base_url}/api/v4/projects/{project_id}/merge_requests"
        
        data = {
            "title": title,
            "description": description,
            "source_branch": source_branch,
            "target_branch": target_branch
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=self.headers, json=data)
            response.raise_for_status()
            
            return response.json()
