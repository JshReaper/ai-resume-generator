@description('The location for all resources')
param location string = resourceGroup().location

@description('The name prefix for all resources')
param namePrefix string = 'airesume'

@description('The SKU for the App Service Plan')
param appServicePlanSku string = 'B1'

@description('The Claude API key (store in Key Vault for production)')
@secure()
param claudeApiKey string

@description('The Claude model to use')
param claudeModel string = 'claude-sonnet-4-20250514'

var uniqueSuffix = uniqueString(resourceGroup().id)
var appServicePlanName = '${namePrefix}-plan-${uniqueSuffix}'
var webAppName = '${namePrefix}-api-${uniqueSuffix}'
var staticWebAppName = '${namePrefix}-web-${uniqueSuffix}'

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: appServicePlanSku
  }
  properties: {
    reserved: false
  }
}

// Web App for API
resource webApp 'Microsoft.Web/sites@2023-01-01' = {
  name: webAppName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      netFrameworkVersion: 'v8.0'
      appSettings: [
        {
          name: 'Claude__ApiKey'
          value: claudeApiKey
        }
        {
          name: 'Claude__Model'
          value: claudeModel
        }
      ]
    }
  }
}

// Static Web App for React frontend
resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: staticWebAppName
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    buildProperties: {
      appLocation: '/client'
      outputLocation: 'build'
    }
  }
}

output apiUrl string = 'https://${webApp.properties.defaultHostName}'
output webAppUrl string = 'https://${staticWebApp.properties.defaultHostname}'
