"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Modal, { Field, FieldSelect } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { updateCustomerRole, type Customer, type CustomerRole } from "@/services/customers";
import { listEnterprises, type Enterprise } from "@/services/enterprises";

interface Props {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
  onConverted: (updated: Customer) => void;
}

export default function ConvertUserModal({ open, onClose, customer, onConverted }: Props) {
  const toast = useToast();
  const [role, setRole] = useState<CustomerRole>("enterprise_user");
  const [enterpriseId, setEnterpriseId] = useState<string>("");
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setRole((customer?.role as CustomerRole) === "individual" ? "enterprise_user" : "individual");
    setEnterpriseId(customer?.enterprise_id ?? "");
    setLoading(true);
    listEnterprises()
      .then(setEnterprises)
      .catch(() => toast.error("Load failed", "Could not load enterprises."))
      .finally(() => setLoading(false));
  }, [open, customer, toast]);

  const needsEnterprise = role !== "individual";
  const canSubmit = useMemo(() => {
    if (!customer) return false;
    if (needsEnterprise && !enterpriseId) return false;
    return true;
  }, [customer, needsEnterprise, enterpriseId]);

  const handleSubmit = async () => {
    if (!customer || !canSubmit) return;
    setSubmitting(true);
    try {
      const updated = await updateCustomerRole(
        customer.id,
        role,
        needsEnterprise ? enterpriseId : null,
      );
      toast.success("Role updated", `${updated.name} is now ${roleLabel(updated.role)}.`);
      onConverted(updated);
      onClose();
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Could not update role.";
      toast.error("Update failed", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={submitting ? () => {} : onClose}
      eyebrow={customer ? `Customer · ${customer.email}` : "Customer"}
      title="Change Role"
      submitLabel={submitting ? "Saving..." : "Apply"}
      onSubmit={handleSubmit}
    >
      <Field label="New role">
        <FieldSelect value={role} onChange={(e) => setRole(e.target.value as CustomerRole)}>
          <option value="individual">Individual</option>
          <option value="enterprise_user">Enterprise User</option>
          <option value="enterprise_admin">Enterprise Admin</option>
        </FieldSelect>
      </Field>
      {needsEnterprise && (
        <Field label="Enterprise" hint={loading ? "loading…" : "required"}>
          <FieldSelect
            value={enterpriseId}
            onChange={(e) => setEnterpriseId(e.target.value)}
            disabled={loading}
          >
            <option value="">Select enterprise…</option>
            {enterprises.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </FieldSelect>
        </Field>
      )}
    </Modal>
  );
}

function roleLabel(role: string): string {
  if (role === "individual") return "an individual user";
  if (role === "enterprise_admin") return "an enterprise admin";
  if (role === "enterprise_user") return "an enterprise user";
  return role;
}
