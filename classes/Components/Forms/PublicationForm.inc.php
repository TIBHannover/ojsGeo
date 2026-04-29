<?php
/**
 * @file classes/components/forms/PublicationForm.php
 * 
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *  
 * @class PublicationForm
 *
 * @brief A preset form for setting a publication's spatio-temporal metadata.
 */

namespace geoMetadata\classes\Components\Forms;

use \PKP\components\forms\FormComponent;
use \PKP\components\forms\FieldTextarea;

class PublicationForm extends FormComponent
{
    /** @copydoc FormComponent::$id */
    public $id = GEOMETADATA_FORM_NAME;

    /** @copydoc FormComponent::$method */
    public $method = 'PUT';

    /** @copydoc FormComponent::$action */
    public $action = '';

    /** @copydoc FormComponent::$successMessage */
    public $successMessage = '';

    /**
     * Constructor
     *
     * @param $action string URL to submit the form to
     * @param $publication Publication The publication to change settings for
     */
    public function __construct($action, $publication, $successMessage)
    {
        $this->action = $action;
        $this->successMessage = $successMessage;

        $this->addField(new FieldTextarea(
            GEOMETADATA_DB_FIELD_TIME_PERIODS, [
                'label' => __('plugins.generic.geoMetadata.geospatialmetadata.properties.temporal'),
                'description' => '',
                'isMultilingual' => false,
                'value' => $publication->getData(GEOMETADATA_DB_FIELD_TIME_PERIODS)
            ]));

        $this->addField(new FieldTextarea(
            GEOMETADATA_DB_FIELD_SPATIAL, [
            'label' => __('plugins.generic.geoMetadata.geospatialmetadata.properties.spatial'),
            'description' => '',
            'isMultilingual' => false,
            'value' => $publication->getData(GEOMETADATA_DB_FIELD_SPATIAL)
        ]));

        $adminUnit = $publication->getData(GEOMETADATA_DB_FIELD_ADMINUNIT);
        if ($adminUnit === null || $adminUnit === '') {
            $adminUnit = '[]';
        }
        $this->addField(new FieldTextarea(
            GEOMETADATA_DB_FIELD_ADMINUNIT, [
            'label' => __('plugins.generic.geoMetadata.geospatialmetadata.properties.spatial.administrativeUnit'),
            'description' => '',
            'isMultilingual' => false,
            'value' => $adminUnit
        ]));
    }
}
