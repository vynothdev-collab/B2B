from pydantic import BaseModel, model_validator


class ExtensionPersonSearchRequest(BaseModel):
    linkedin_url: str


class ExtensionCompanySearchRequest(BaseModel):
    linkedin_url: str | None = None
    website: str | None = None
    company_name: str | None = None

    @model_validator(mode="after")
    def validate_at_least_one(self):
        if not any([self.linkedin_url, self.website, self.company_name]):
            raise ValueError(
                "Provide at least one of: linkedin_url, website, company_name"
            )
        return self
