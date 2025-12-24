# Tool Improvements Breakdown - Port Configuration

**Which tools need improvements and how to implement them**

---

## 🎯 Tools That Need Improvements

### 1. **Shell Games Toolkit** ⚠️ PRIMARY TARGET
**Repository:** https://github.com/KyPython/shell-games

**Problem:** If it generates start/stop scripts during project setup or deployment, those scripts likely have hardcoded ports.

**Files to Check/Update:**
- `scripts/new-node-project.sh` - Check if it generates start/stop scripts
- `scripts/simple-deploy.sh` - Check for port references
- Any script templates that generate development scripts

**Improvements Needed:**

#### A. Create Port Configuration System
**File to Create:** `scripts/lib/port-config.sh`
```bash
#!/bin/bash
# Port configuration loader
# Loads ports from .devops/ports.conf or .env

PORT_CONFIG_FILE=".devops/ports.conf"
ENV_FILE=".env"

# Load from config file if exists
if [ -f "$PORT_CONFIG_FILE" ]; then
  source "$PORT_CONFIG_FILE"
fi

# Load from .env if exists
if [ -f "$ENV_FILE" ]; then
  export $(cat "$ENV_FILE" | grep -v '^#' | grep PORT | xargs)
fi

# Set defaults
FRONTEND_PORT=${FRONTEND_PORT:-3000}
BACKEND_PORT=${PORT:-3030}
AUTOMATION_PORT=${AUTOMATION_PORT:-7070}
METRICS_PORT=${BACKEND_METRICS_PORT:-9091}
```

#### B. Create Port Config Template
**File to Create:** `.devops/ports.conf.example`
```bash
# Port Configuration
# Copy to .devops/ports.conf and customize

FRONTEND_PORT=3000
BACKEND_PORT=3030
AUTOMATION_PORT=7070
METRICS_PORT=9091

# Observability Stack
GRAFANA_PORT=3001
PROMETHEUS_PORT=9090
LOKI_PORT=3100
TEMPO_PORT=3200
OTEL_PORT=4318
```

#### C. Add Port Validation
**File to Update:** `scripts/dev-env-check.sh`
Add function:
```bash
check_port_config() {
  if [ -f ".devops/ports.conf" ]; then
    # Validate port ranges
    # Check for conflicts
    # Warn about common issues
  fi
}
```

#### D. Update Script Generation
**File to Update:** `scripts/new-node-project.sh` (if it generates start/stop scripts)
- Generate `.devops/ports.conf` file
- Generate scripts that use port config
- Include `load-ports.sh` in generated scripts

**Implementation Steps:**
1. Create `scripts/lib/port-config.sh`
2. Create `.devops/ports.conf.example`
3. Update `new-node-project.sh` to generate port config
4. Update any script templates to use port variables
5. Add port validation to `dev-env-check.sh`

---

### 2. **Code Generator Tool** ⚠️ SECONDARY TARGET
**Repository:** https://github.com/KyPython/code-generator-tool

**Problem:** Templates may generate code with hardcoded ports (e.g., route templates with port 3000)

**Files to Check/Update:**
- `templates/route/__Name__Route.ts.tpl` - Check for port references
- `src/generator.ts` - Add port placeholder support
- Any templates that reference ports

**Improvements Needed:**

#### A. Add Port Placeholder Support
**File to Update:** `src/generator.ts`
Add support for placeholders:
- `__PORT__` - Backend port
- `__FRONTEND_PORT__` - Frontend port
- `__AUTOMATION_PORT__` - Automation port

#### B. Create Port Config Template Type
**File to Create:** `templates/port-config/ports.conf.tpl`
```bash
# Generated port configuration
FRONTEND_PORT=${FRONTEND_PORT:-3000}
BACKEND_PORT=${PORT:-3030}
```

#### C. Update Route Templates
**File to Update:** `templates/route/__Name__Route.ts.tpl` (if it has ports)
Replace hardcoded ports with `__PORT__` placeholder

**Implementation Steps:**
1. Add port placeholder support to generator
2. Create port config template
3. Update existing templates to use placeholders
4. Add CLI option: `gen port-config` to generate port config

---

### 3. **Ubiquitous Automation** (If applicable)
**Repository:** https://github.com/KyPython/ubiquitous-automation

**Problem:** May generate CI/CD scripts or deployment scripts with hardcoded ports

**Files to Check:**
- `.github/workflows/ci.yml` - Check for hardcoded ports
- Any script generation logic

**Improvements Needed:**
- If it generates scripts: Same as Shell Games Toolkit
- If it doesn't: No changes needed

---

## 🔧 Implementation Plan

### Phase 1: Port Configuration System (Critical)

**For Shell Games Toolkit:**

1. **Create Port Config Loader**
   ```bash
   # scripts/lib/port-config.sh
   # Loads ports from config/env with defaults
   ```

2. **Create Port Config Template**
   ```bash
   # .devops/ports.conf.example
   # Template for port configuration
   ```

3. **Update Script Generation**
   - Modify `new-node-project.sh` to generate port config
   - Update any script templates to use port variables
   - Include port config loader in generated scripts

**For Code Generator Tool:**

1. **Add Port Placeholders**
   - Update generator to support `__PORT__`, `__BACKEND_PORT__`, etc.
   - Create port config template type

2. **Template Updates**
   - Update route templates if they reference ports
   - Add port config generation option

---

### Phase 2: Dynamic Port Generation

**Update Generated Scripts:**

1. **Start Scripts**
   ```bash
   # Generated start-dev.sh should:
   source .devops/load-ports.sh
   npm start -- --port $FRONTEND_PORT
   ```

2. **Stop Scripts**
   ```bash
   # Generated stop-dev.sh should:
   source .devops/load-ports.sh
   lsof -ti :$FRONTEND_PORT | xargs kill
   ```

3. **Health Check Scripts**
   ```bash
   # Generated health-check.sh should:
   source .devops/load-ports.sh
   curl http://localhost:$BACKEND_PORT/health
   ```

---

### Phase 3: Validation & Conflict Detection

**Add to Shell Games Toolkit:**

1. **Port Conflict Detection**
   ```bash
   # Add to dev-env-check.sh or new script
   check_port_conflicts() {
     # Check if ports are in use
     # Validate port ranges
     # Detect duplicates
   }
   ```

2. **Config Validation**
   ```bash
   # Validate .devops/ports.conf
   # Check for valid port ranges (1024-65535)
   # Warn about common conflicts
   ```

---

### Phase 4: Migration Tool

**Create Migration Script:**

```bash
# scripts/migrate-ports.sh
# 1. Scan existing scripts for hardcoded ports
# 2. Extract ports to config file
# 3. Update scripts to use config
# 4. Generate migration report
```

---

## 📋 Specific File Changes Needed

### Shell Games Toolkit

**Files to Create:**
- `scripts/lib/port-config.sh` - Port configuration loader
- `scripts/lib/port-validation.sh` - Port validation functions
- `.devops/ports.conf.example` - Port config template
- `scripts/migrate-ports.sh` - Migration tool

**Files to Update:**
- `scripts/new-node-project.sh` - Generate port config if creating multi-service project
- `scripts/dev-env-check.sh` - Add port validation
- Any script templates that generate start/stop scripts

### Code Generator Tool

**Files to Create:**
- `templates/port-config/ports.conf.tpl` - Port config template
- Port placeholder support in generator

**Files to Update:**
- `src/generator.ts` - Add port placeholder support
- `templates/route/__Name__Route.ts.tpl` - Use port placeholders if applicable
- `src/cli.ts` - Add port config generation option

---

## 🎯 Priority Order

1. **Shell Games Toolkit** - Port config system (if it generates scripts)
2. **Code Generator Tool** - Port placeholder support (if templates have ports)
3. **Migration Tool** - Help existing projects upgrade
4. **Validation** - Port conflict detection

---

## ✅ Testing Checklist

After implementation, verify:
- [ ] Generated scripts use port config
- [ ] Port config can be overridden via .env
- [ ] Start/stop scripts stay in sync
- [ ] Port conflicts are detected
- [ ] Migration tool works on existing projects
- [ ] Default ports work if config missing
- [ ] Health checks use dynamic ports

---

## 🔍 Identified Issues

### Found Hardcoded Ports:

1. **Shell Games Toolkit** - `scripts/custom-env-checks.sh.example`
   - Line 52: `http://localhost:3000/health` (hardcoded)
   - Line 59: `http://localhost:8000/health` (hardcoded)
   - **Fix:** Use port variables from config

2. **Potential Issues:**
   - Any scripts generated during client setup
   - Start/stop scripts created by suite (if any)
   - Health check scripts with hardcoded ports

---

## 📝 Quick Fix for Current Issue

**File:** `shell-games/scripts/custom-env-checks.sh.example`

**Current (Line 52):**
```bash
if ! curl -f -s http://localhost:3000/health >/dev/null 2>&1; then
```

**Should Be:**
```bash
FRONTEND_PORT=${FRONTEND_PORT:-3000}
if ! curl -f -s http://localhost:$FRONTEND_PORT/health >/dev/null 2>&1; then
```

**Current (Line 59):**
```bash
if ! curl -f -s http://localhost:8000/health >/dev/null 2>&1; then
```

**Should Be:**
```bash
BACKEND_PORT=${BACKEND_PORT:-8000}
if ! curl -f -s http://localhost:$BACKEND_PORT/health >/dev/null 2>&1; then
```

---

**Last Updated:** 2025-12-20  
**Status:** Issues Identified - Ready for Implementation
