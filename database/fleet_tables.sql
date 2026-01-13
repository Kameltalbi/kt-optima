-- ============================================
-- FLEET MANAGEMENT (GESTION DE PARC)
-- Tables pour le module Gestion de parc
-- ============================================

-- Equipment
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('vehicle', 'machine', 'it', 'other')),
    reference VARCHAR(100) NOT NULL,
    acquisition_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive')),
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
    department VARCHAR(255),
    employee_id UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
    comments TEXT,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Assignments (historique des affectations)
CREATE TABLE equipment_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
    department VARCHAR(255),
    employee_id UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    comments TEXT,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance (entretiens)
CREATE TABLE maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('maintenance', 'repair', 'inspection')),
    description TEXT NOT NULL,
    cost DECIMAL(15, 2) NOT NULL DEFAULT 0,
    next_due_date DATE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fleet Alerts (alertes automatiques)
CREATE TABLE fleet_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('upcoming_maintenance', 'overdue_maintenance', 'inactive_equipment')),
    message TEXT NOT NULL,
    due_date DATE,
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_equipment_company_id ON equipment(company_id);
CREATE INDEX idx_equipment_category ON equipment(category);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_reference ON equipment(reference);
CREATE INDEX idx_equipment_employee_id ON equipment(employee_id);
CREATE INDEX idx_equipment_assignments_equipment_id ON equipment_assignments(equipment_id);
CREATE INDEX idx_equipment_assignments_company_id ON equipment_assignments(company_id);
CREATE INDEX idx_maintenance_equipment_id ON maintenance(equipment_id);
CREATE INDEX idx_maintenance_company_id ON maintenance(company_id);
CREATE INDEX idx_maintenance_date ON maintenance(date);
CREATE INDEX idx_maintenance_next_due_date ON maintenance(next_due_date);
CREATE INDEX idx_fleet_alerts_equipment_id ON fleet_alerts(equipment_id);
CREATE INDEX idx_fleet_alerts_company_id ON fleet_alerts(company_id);
CREATE INDEX idx_fleet_alerts_type ON fleet_alerts(type);
CREATE INDEX idx_fleet_alerts_priority ON fleet_alerts(priority);

-- Triggers for updated_at
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON maintenance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
