import type { UserCategory } from '../auth/api'

interface CategoryMultiSelectProps {
  value: UserCategory[]
  onChange: (categories: UserCategory[]) => void
}

const CategoryMultiSelect: React.FC<CategoryMultiSelectProps> = ({
  value,
  onChange
}) => {
  const categories: { value: UserCategory; label: string }[] = [
    { value: 'mahasiswa', label: 'Mahasiswa' },
    { value: 'dosen', label: 'Dosen' },
    { value: 'staff', label: 'Staff' }
  ]

  const handleCheckboxChange = (category: UserCategory) => {
    if (value.includes(category)) {
      onChange(value.filter(c => c !== category))
    } else {
      onChange([...value, category])
    }
  }

  return (
    <div>
      <label style={{
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#2c3e50'
      }}>
        Allowed Categories (optional)
      </label>
      <p style={{
        fontSize: '12px',
        color: '#6c757d',
        marginBottom: '12px'
      }}>
        Leave empty to allow all categories. Select specific categories to restrict registration.
      </p>
      <div style={{
        padding: '12px',
        border: '1px solid #ced4da',
        borderRadius: '6px',
        backgroundColor: 'white'
      }}>
        {categories.map(cat => (
          <div key={cat.value} style={{ marginBottom: '8px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              <input
                type="checkbox"
                checked={value.includes(cat.value)}
                onChange={() => handleCheckboxChange(cat.value)}
                style={{
                  marginRight: '8px',
                  cursor: 'pointer',
                  width: '16px',
                  height: '16px'
                }}
              />
              {cat.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CategoryMultiSelect
